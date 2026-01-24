import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Cloud } from '@react-three/drei';
import CrazyCharacter from './CrazyCharacter';

export default function ThreeScene() {
    return (
        <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls enableZoom={false} enablePan={false} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Cloud opacity={0.5} speed={0.4} width={10} depth={1.5} segments={20} position={[0, -2, -5]} />

            <CrazyCharacter />
        </Canvas>
    );
}
