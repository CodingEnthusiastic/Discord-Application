// services/KafkaProducerService.js
const { Kafka } = require('kafkajs');

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'discord-backend';

class KafkaProducerService {
    constructor() {
        this.kafka = null;
        this.producer = null;
    }

    async connect() {
        if (this.producer) return this.producer;

        this.kafka = new Kafka({
            clientId: KAFKA_CLIENT_ID,
            brokers: KAFKA_BROKERS,
            retry: {
                initialRetryTime: 100,
                retries: 3,
                maxRetryTime: 3000,
            },
            connectionTimeout: 3000,
            requestTimeout: 3000,
        });

        this.producer = this.kafka.producer();
        try {
            await Promise.race([
                this.producer.connect(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Kafka connection timeout')), 3000))
            ]);
            console.log('Kafka Producer connected');
        } catch (err) {
            console.warn('⚠️ Kafka producer connection failed - continuing without Kafka:', err.message);
            this.producer = null;
        }
        return this.producer;
    }

    async disconnect() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }

    // Publish message event
    async publishMessage(message) {
        try {
            await this.producer.send({
                topic: 'messages',
                messages: [
                    {
                        key: message.channelId || message.conversationId,
                        value: JSON.stringify({
                            type: 'new_message',
                            timestamp: new Date().toISOString(),
                            data: message
                        }),
                    },
                ],
            });
            console.log('Message published to Kafka:', message._id);
            return true;
        } catch (err) {
            console.error('Failed to publish message:', err);
            return false;
        }
    }

    // Publish user activity event
    async publishUserActivity(activity) {
        try {
            await this.producer.send({
                topic: 'user-activity',
                messages: [
                    {
                        key: activity.userId,
                        value: JSON.stringify({
                            type: activity.type, // 'user_joined', 'user_left', 'typing'
                            timestamp: new Date().toISOString(),
                            data: activity
                        }),
                    },
                ],
            });
            return true;
        } catch (err) {
            console.error('Failed to publish user activity:', err);
            return false;
        }
    }

    // Publish reaction event
    async publishReaction(reaction) {
        try {
            await this.producer.send({
                topic: 'reactions',
                messages: [
                    {
                        key: reaction.messageId,
                        value: JSON.stringify({
                            type: 'reaction_added',
                            timestamp: new Date().toISOString(),
                            data: reaction
                        }),
                    },
                ],
            });
            return true;
        } catch (err) {
            console.error('Failed to publish reaction:', err);
            return false;
        }
    }

    // Publish notification event
    async publishNotification(notification) {
        try {
            await this.producer.send({
                topic: 'notifications',
                messages: [
                    {
                        key: notification.recipientId,
                        value: JSON.stringify({
                            type: 'notification',
                            timestamp: new Date().toISOString(),
                            data: notification
                        }),
                    },
                ],
            });
            return true;
        } catch (err) {
            console.error('Failed to publish notification:', err);
            return false;
        }
    }
}

module.exports = new KafkaProducerService();
