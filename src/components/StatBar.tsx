import styles from './StatBar.module.css';

interface StatBarProps {
  label: string;
  value: number;
  color: 'red' | 'yellow' | 'blue';
}

export function StatBar({ label, value, color }: StatBarProps) {
  const getColorClass = () => {
    switch (color) {
      case 'red': return styles.red;
      case 'yellow': return styles.yellow;
      case 'blue': return styles.blue;
      default: return styles.blue;
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <div className={styles.barBg}>
        <div 
          className={`${styles.barFill} ${getColorClass()}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
