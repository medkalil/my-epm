import { Spin } from 'antd';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  return (
    <div className={fullScreen ? styles.fullScreen : styles.inline}>
      <Spin size={fullScreen ? 'large' : 'default'} />
    </div>
  );
}