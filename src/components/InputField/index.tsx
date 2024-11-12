import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  onIconPress?: () => void;
  iconName?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
  onIconPress,
  iconName,
}) => (
  <View style={[styles.groupField]}>
    <Text style={[styles.fieldLabel]}>{label}</Text>
    <View
      style={{
        width: '100%',
        height: 45,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        justifyContent: 'center',
      }}>
      <TextInput
        style={{color: '#242c40'}}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
      {iconName && (
        <TouchableOpacity
          style={{position: 'absolute', right: 10}}
          onPress={onIconPress}>
          <Icon name={iconName} size={20} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  groupField: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default InputField;