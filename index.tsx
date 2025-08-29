import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, FlatList } from 'react-native';

interface DragAndDropListProps<T> {
  data: T[];
  title?: string;
  onTap?: (item: T, index: number) => void;
  groupBy?: keyof T | ((item: T) => string);
  onDrop?: (position: { x: number; y: number }) => void;
  style?: any;
}

type ListItem = { key?: string | number; id?: string | number; title?: string; subtitle?: string };

interface GroupedData<T> {
  groupKey: string;
  items: T[];
}

function DragAndDropList<T extends ListItem>({ 
  data, 
  title, 
  onTap, 
  groupBy, 
  onDrop, 
  style = {} 
}: DragAndDropListProps<T>) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only start dragging if the gesture is significant enough
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Allow dragging if the gesture is significant
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        isDragging.current = false;
        pan.flattenOffset();
        onDrop && onDrop({ x: gestureState.moveX, y: gestureState.moveY });
      },
    })
  ).current;

  // Normalize data to always have a string key
  const normalizedData = (data || []).map((item, idx) => {
    let key: string;
    if (item && (item.key !== undefined || typeof item.id !== 'undefined')) {
      const baseKey = item.key ?? item.id;
      key = (baseKey ?? `auto-key-${idx}`).toString() + '-' + idx;
    } else {
      key = `auto-key-${idx}`;
    }
    return { ...item, key };
  });

  // Group data if groupBy is provided
  const groupedData = useMemo(() => {
    if (!groupBy) return null;

    const groups = new Map<string, T[]>();
    
    normalizedData.forEach((item) => {
      let groupKey: string;
      
      if (typeof groupBy === 'function') {
        groupKey = groupBy(item);
      } else {
        groupKey = String(item[groupBy] || 'Unknown');
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    return Array.from(groups.entries()).map(([groupKey, items]) => ({
      groupKey,
      items
    }));
  }, [normalizedData, groupBy]);

  const handleItemTap = (item: T, index: number) => {
    // Only trigger tap if we're not dragging
    if (!isDragging.current) {
      onTap && onTap(item, index);
    }
  };

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => handleItemTap(item as T, index)}
      activeOpacity={onTap ? 0.7 : 1}
      delayPressIn={100}
    >
      <Text style={styles.title}>{item.title || ''}</Text>
      <Text style={styles.subtitle}>{item.subtitle || ''}</Text>
    </TouchableOpacity>
  );

  const renderGroup = ({ item }: { item: GroupedData<T> }) => (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{item.groupKey}</Text>
      {item.items.map((listItem, index) => renderItem({ item: listItem, index }))}
    </View>
  );

  const renderContent = () => {
    if (groupedData) {
      return (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.groupKey}
          renderItem={renderGroup}
          scrollEnabled={false}
        />
      );
    } else {
      return (
        <FlatList
          data={normalizedData}
          keyExtractor={item => item.key as string}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      );
    }
  };

  return (
    <Animated.View
      style={[styles.draggableWrapper, { transform: pan.getTranslateTransform() }, style]}
      {...panResponder.panHandlers}
    >
      <View style={styles.container}>
        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        )}
        {renderContent()}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  draggableWrapper: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  container: {
    width: '100%',
    maxHeight: 400,
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  group: {
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: 8,
    paddingHorizontal: 16,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
  },
});

export default DragAndDropList;