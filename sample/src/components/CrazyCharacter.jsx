import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Box } from '@react-three/drei';

export default function CrazyCharacter() {
    const group = useRef();

    // Animate the character to look around or bob
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = Math.sin(t / 2) * 0.2;
        group.current.rotation.z = Math.cos(t / 2) * 0.1;
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <group ref={group} position={[2, 0, 0]} scale={0.8}>
                {/* Head */}
                <Sphere args={[1, 32, 32]} position={[0, 1.5, 0]}>
                    <meshStandardMaterial color="#ff7eb3" roughness={0.3} metalness={0.1} />
                </Sphere>

                {/* Eyes */}
                <Sphere args={[0.25, 32, 32]} position={[-0.3, 1.6, 0.85]}>
                    <meshStandardMaterial color="white" />
                </Sphere>
                <Sphere args={[0.25, 32, 32]} position={[0.3, 1.6, 0.85]}>
                    <meshStandardMaterial color="white" />
                </Sphere>
                <Sphere args={[0.1, 32, 32]} position={[-0.3, 1.6, 1.05]}>
                    <meshStandardMaterial color="black" />
                </Sphere>
                <Sphere args={[0.1, 32, 32]} position={[0.3, 1.6, 1.05]}>
                    <meshStandardMaterial color="black" />
                </Sphere>

                {/* Body */}
                <Box args={[1.2, 1.5, 0.8]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#e0c3fc" />
                </Box>

                {/* Arms */}
                <Box args={[0.4, 1.2, 0.4]} position={[-0.9, 0, 0]} rotation={[0, 0, 0.2]}>
                    <meshStandardMaterial color="#ff7eb3" />
                </Box>
                <Box args={[0.4, 1.2, 0.4]} position={[0.9, 0, 0]} rotation={[0, 0, -0.2]}>
                    <meshStandardMaterial color="#ff7eb3" />
                </Box>
            </group>
        </Float>
    );
}
