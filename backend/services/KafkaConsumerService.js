// services/KafkaConsumerService.js
import { Kafka } from 'kafkajs';
import RedisService from './RedisService.js';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'discord-backend';

class KafkaConsumerService {
    constructor() {
        this.kafka = null;
        this.consumers = {};
        this.io = null; // Socket.io instance for fanout
    }

    async connect(io) {
        if (Object.keys(this.consumers).length > 0) return;

        this.io = io;
        this.kafka = new Kafka({
            clientId: KAFKA_CLIENT_ID,
            brokers: KAFKA_BROKERS,
            retry: {
                initialRetryTime: 100,
                retries: 8,
            },
        });

        console.log('Kafka Consumer initialized');
    }

    // Consumer for messages - updates Redis and fanouts to users
    async startMessagesConsumer() {
        try {
            const consumer = this.kafka.consumer({ groupId: 'messages-group' });
            this.consumers['messages'] = consumer;

            await consumer.connect();
            await consumer.subscribe({ topic: 'messages', fromBeginning: false });

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const eventData = JSON.parse(message.value.toString());
                        const { data } = eventData;

                        // Cache message in Redis
                        await RedisService.cacheMessage(
                            data.channelId || data.conversationId,
                            data
                        );

                        // Fanout to connected users
                        if (this.io) {
                            const room = data.channelId || data.conversationId;
                            this.io.to(room).emit('new_message', data);
                        }

                        console.log('Message processed:', data._id);
                    } catch (err) {
                        console.error('Error processing message:', err);
                    }
                },
            });

            console.log('Messages consumer started');
        } catch (err) {
            console.error('Failed to start messages consumer:', err);
        }
    }

    // Consumer for user activity
    async startActivityConsumer() {
        try {
            const consumer = this.kafka.consumer({ groupId: 'activity-group' });
            this.consumers['activity'] = consumer;

            await consumer.connect();
            await consumer.subscribe({ topic: 'user-activity', fromBeginning: false });

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const eventData = JSON.parse(message.value.toString());
                        const { type, data } = eventData;

                        if (type === 'user_joined') {
                            await RedisService.setActiveUser(data.userId, data.channelId, data);
                            if (this.io) {
                                this.io.to(data.channelId).emit('user_joined', data);
                            }
                        } else if (type === 'user_left') {
                            if (this.io) {
                                this.io.to(data.channelId).emit('user_left', data);
                            }
                        } else if (type === 'typing') {
                            if (this.io) {
                                this.io.to(data.channelId).emit('user_typing', data);
                            }
                        }

                        console.log('Activity processed:', type, data.userId);
                    } catch (err) {
                        console.error('Error processing activity:', err);
                    }
                },
            });

            console.log('Activity consumer started');
        } catch (err) {
            console.error('Failed to start activity consumer:', err);
        }
    }

    // Consumer for reactions
    async startReactionsConsumer() {
        try {
            const consumer = this.kafka.consumer({ groupId: 'reactions-group' });
            this.consumers['reactions'] = consumer;

            await consumer.connect();
            await consumer.subscribe({ topic: 'reactions', fromBeginning: false });

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const eventData = JSON.parse(message.value.toString());
                        const { data } = eventData;

                        // Fanout to connected users
                        if (this.io) {
                            const room = data.channelId || data.conversationId;
                            this.io.to(room).emit('reaction_added', data);
                        }

                        console.log('Reaction processed:', data.messageId);
                    } catch (err) {
                        console.error('Error processing reaction:', err);
                    }
                },
            });

            console.log('Reactions consumer started');
        } catch (err) {
            console.error('Failed to start reactions consumer:', err);
        }
    }

    // Consumer for notifications
    async startNotificationsConsumer() {
        try {
            const consumer = this.kafka.consumer({ groupId: 'notifications-group' });
            this.consumers['notifications'] = consumer;

            await consumer.connect();
            await consumer.subscribe({ topic: 'notifications', fromBeginning: false });

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const eventData = JSON.parse(message.value.toString());
                        const { data } = eventData;

                        // Fanout to specific user
                        if (this.io) {
                            this.io.to(`user:${data.recipientId}`).emit('notification', data);
                        }

                        console.log('Notification sent to:', data.recipientId);
                    } catch (err) {
                        console.error('Error processing notification:', err);
                    }
                },
            });

            console.log('Notifications consumer started');
        } catch (err) {
            console.error('Failed to start notifications consumer:', err);
        }
    }

    // Start all consumers
    async startAllConsumers() {
        await this.startMessagesConsumer();
        await this.startActivityConsumer();
        await this.startReactionsConsumer();
        await this.startNotificationsConsumer();
    }

    // Disconnect all consumers
    async disconnectAll() {
        for (const [name, consumer] of Object.entries(this.consumers)) {
            try {
                await consumer.disconnect();
                console.log(`${name} consumer disconnected`);
            } catch (err) {
                console.error(`Error disconnecting ${name} consumer:`, err);
            }
        }
        this.consumers = {};
    }
}

export default new KafkaConsumerService();
