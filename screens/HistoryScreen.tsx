import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerParamList } from '@/navigation/DrawerNavigator';
import { toTitleCase } from '@/utils/utils';
import SelectDropdown from 'react-native-select-dropdown';
import { COLORS } from '@/styles/colors';
import { useTranslation } from 'react-i18next';


type Props = DrawerScreenProps<DrawerParamList, 'History'>;


export default function HistoryScreen({ navigation }: Props) {
    const [data, setData] = useState([]);
    const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const { t } = useTranslation();

    useEffect(() => {
        const getAllKeys = async () => {
            const allKeys = await AsyncStorage.getAllKeys()
            for (let key of allKeys) {
                if (['theme', 'fontSize', 'language', 'units', 'notifications'].includes(key)) continue;

                const keyData = await AsyncStorage.getItem(key)
                
                if (!keyData) continue;

                try {
                    const parsedData = JSON.parse(keyData)
                    setData(prev => ({...prev, [key]: parsedData}))
                } catch (e) {
                    console.error(e)
                }[]
            }
        }
        getAllKeys()
    }, [])

    useEffect(() => {
        if (!data) return;
        const keys = Object.keys(data)
        keys.splice(0, 0, 'All')
        setExerciseOptions(keys);
    }, [data]);

    // TODO: i18n exercises
    const renderExercise = ({ item }: { item: any }, progress: any) => (
        <View style={{
            ...styles.row, 
            ...(progress === 'worse' 
                ? { borderLeftWidth: 5, borderLeftColor: '#F93827' } 
                : progress === 'neutral' 
                    ? { borderLeftWidth: 5, borderLeftColor: COLORS.orange }
                    : progress === 'better' 
                        ? { borderLeftWidth: 5, borderLeftColor: '#16C47F' }
                        : { borderLeftWidth: 5, borderLeftColor: '#FFF' }
            ) 
            }}>
            <Text style={styles.cell}>{item.date}</Text>
            <Text style={styles.cell}>{toTitleCase(item.muscleGroup)}</Text>
            <Text style={styles.cell}>{item.weightValue} {item.units}</Text>
            <Text style={styles.cell}>{item.repsValue}</Text>
        </View>
    );

    const renderTable = () => {
        let keys = Object.keys(data)
        
        if (selectedExercise && selectedExercise !== 'All') {
            keys = keys.filter(item => item === selectedExercise)
        }

        return keys.map((exerciseName) => {
            return (
                <View style={styles.exerciseSection}>
                    <Text style={styles.exerciseHeader}>{exerciseName}</Text>
                    <View style={[styles.row, styles.headerRow]}>
                        <Text style={[styles.cell, styles.headerCell]}>{t('history.table.header.date')}</Text>
                        <Text style={[styles.cell, styles.headerCell]}>{t('history.table.header.muscle')}</Text>
                        <Text style={[styles.cell, styles.headerCell]}>{t('history.table.header.weight')}</Text>
                        <Text style={[styles.cell, styles.headerCell]}>{t('history.table.header.reps')}</Text>
                    </View>
                    {data[exerciseName].map((record: any, index: number) => {
                        let progress = 'new'
                        if (index > 0) {
                            const previousSet = data[exerciseName][index - 1]
                            const previousScore = parseInt(previousSet.weightValue) * parseInt(previousSet.repsValue)
                            const currentScore = parseInt(record.weightValue) * parseInt(record.repsValue)
                            if (previousScore > currentScore) {
                                progress = 'worse'
                            } else if (previousScore < currentScore) {
                                progress = 'better'
                            } else {
                                progress = 'neutral'
                            }
                        }
                        return renderExercise({ item: record }, progress);
                    })}

                </View>
            )
        })
    };

    return (
        <ScrollView style={styles.container}>
            <Text>Exercise:</Text>
              <SelectDropdown
                    data={exerciseOptions}
                    onSelect={(selectedItem, index) => setSelectedExercise(selectedItem)}
                    showsVerticalScrollIndicator={false}
                    renderButton={(selectedItem) => (
                        <View>
                            {!selectedExercise && <Text>{'All'}</Text>} 
                            <Text>{selectedItem}</Text>
                        </View>
                    )}
                    renderItem={(item, index, isSelected) => (
                        <View>
                            <Text>{item}</Text>
                        </View>
                    )}
                />
            {renderTable()}
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f9fa',
    },
    exerciseSection: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
    },
    exerciseHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerRow: {
        borderBottomWidth: 2,
        borderBottomColor: '#dee2e6',
        backgroundColor: '#f1f3f5',
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        color: '#495057',
    },
    headerCell: {
        fontWeight: 'bold',
        color: '#343a40',
    },
});
