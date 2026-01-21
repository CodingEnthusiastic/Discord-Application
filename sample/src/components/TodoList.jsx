import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { v4 as uuidv4 } from 'uuid';

export default function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const addTask = () => {
        if (!inputValue.trim()) return;
        const newTask = {
            id: uuidv4(),
            text: inputValue,
            completed: false,
            createdAt: Date.now()
        };
        setTasks([...tasks, newTask]);
        setInputValue('');
    };

    const getDuration = (createdAt) => {
        const diff = Math.floor((now - createdAt) / 1000);
        const mins = Math.floor(diff / 60).toString().padStart(2, '0');
        const secs = (diff % 60).toString().padStart(2, '0');
        return `${mins}:${secs}s`;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') addTask();
    };

    const completeTask = (id) => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff7eb3', '#e0c3fc', '#8ec5fc']
        });

        setTasks(tasks.filter((task) => task.id !== id));
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '500px',
            background: 'rgba(255,255,255,0.25)',
            padding: '2rem',
            borderRadius: '40px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff', fontSize: '2.5rem', textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}>
                My Crazy Tasks!
            </h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type something wild..."
                    style={{
                        flex: 1,
                        padding: '15px 20px',
                        borderRadius: '50px',
                        border: 'none',
                        fontSize: '1.2rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={addTask}
                    style={{
                        padding: '15px 30px',
                        borderRadius: '50px',
                        border: 'none',
                        background: '#ff7eb3',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontFamily: 'inherit',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    Add
                </motion.button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <AnimatePresence>
                    {tasks.map((task) => (
                        <motion.li
                            key={task.id}
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 1.2, rotate: 10 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            style={{
                                marginBottom: '15px',
                                background: 'rgba(255, 255, 255, 0.6)',
                                padding: '15px 20px',
                                borderRadius: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                cursor: 'pointer'
                            }}
                            onClick={() => completeTask(task.id)}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '1.5rem', color: '#4a4a4a' }}>{task.text}</span>
                                <span style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                                    ⏱️ {getDuration(task.createdAt)}
                                </span>
                            </div>
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{ fontSize: '1.5rem' }}
                            >
                                🎈
                            </motion.span>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
            {tasks.length === 0 && (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>
                    No tasks? Time to party! 🎉
                </p>
            )}
        </div>
    );
}
