import React from 'react';
import { Card, CardProps, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface AnimatedCardProps extends CardProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  sx,
  ...props 
}) => {
  const theme = useTheme();

  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: 20 };
      case 'down': return { y: -20 };
      case 'left': return { x: 20 };
      case 'right': return { x: -20 };
      default: return { y: 20 };
    }
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0,
        ...getDirectionOffset()
      }}
      animate={{ 
        opacity: 1,
        x: 0,
        y: 0
      }}
      transition={{ 
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      <Card
        sx={{
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.palette.mode === 'light' 
              ? '0 8px 32px rgba(0,0,0,0.12)' 
              : '0 8px 32px rgba(0,0,0,0.4)',
            transform: 'translateY(-4px)',
          },
          ...sx
        }}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard; 