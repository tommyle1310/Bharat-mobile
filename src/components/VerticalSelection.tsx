import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { theme } from '../theme';

const VerticalSelection = () => {
  const items = [
    {
      id: 1,
      title: 'Insurance',
      subtitle: 'Insurance type',
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800',
      gradient: ['#67c151', '#059669'],
    },
    {
      id: 2,
      title: 'Banking',
      subtitle: 'banking type',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      gradient: ['#2563EB', '#1D4ED8'],
    },
  ];

  return (
    <View style={{ 
      gap: theme.spacing.lg, 
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md 
    }}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radii.xl,
            overflow: 'hidden',
            ...theme.shadows.md,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
          }}
        >
          <View
            style={{
              flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
              alignItems: 'center',
              padding: theme.spacing.xl,
              minHeight: 120,
            }}
          >
            {/* Content Section */}
            <View style={{ 
              flex: 1, 
              paddingRight: index % 2 === 0 ? theme.spacing.lg : 0,
              paddingLeft: index % 2 === 0 ? 0 : theme.spacing.lg,
            }}>
              <Text style={{ 
                fontSize: theme.fontSizes.xl, 
                fontWeight: '700', 
                color: index % 2 === 0 ? theme.colors.primary : theme.colors.info,
                marginBottom: theme.spacing.xs,
                letterSpacing: -0.5,
              }}>
                {item.title}
              </Text>
              <Text style={{ 
                fontSize: theme.fontSizes.sm, 
                color: theme.colors.textSecondary,
                lineHeight: 20,
                marginBottom: theme.spacing.md,
              }}>
                {item.subtitle}
              </Text>
              
              {/* Modern accent indicator */}
              <View style={{
                width: 40,
                height: 3,
                backgroundColor: item.gradient[0],
                borderRadius: theme.radii.pill,
                opacity: 0.8,
              }} />
            </View>

            {/* Image Section */}
            <View style={{
              position: 'relative',
            }}>
              <Image
                source={{ uri: item.image }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: theme.radii.lg,
                }}
                resizeMode="cover"
              />
              
              {/* Subtle overlay for modern look */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: theme.radii.lg,
              }} />
            </View>
          </View>
          
          {/* Bottom accent bar */}
          <View style={{
            height: 3,
            backgroundColor: item.gradient[0],
            opacity: 0.1,
          }} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default VerticalSelection;
