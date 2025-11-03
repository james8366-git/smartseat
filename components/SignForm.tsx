import React, { useRef } from 'react';
import { StyleSheet, Platform, View} from 'react-native';
import BorderedInput from './BorderedInput';
import { Picker } from '@react-native-picker/picker';

function SignForm({isSignUp, onSubmit, form, createChangeTextHandler}){
 
    const nameRef = useRef();
    const student_numRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const nicknameRef = useRef();

    const DEPARTMENTS = [
        '컴퓨터공학과',
        '데이터사이언스학과',
        '인공지능학과',
    ];


    return (
    <>
      {isSignUp && (
        <BorderedInput
          hasMarginBottom
          placeholder="성명"
          value={form.name}
          onChangeText={createChangeTextHandler('name')}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          ref={nameRef}
          onSubmitEditing={() => student_numRef.current?.focus()}
        />
      )}

      <BorderedInput
        hasMarginBottom
        placeholder="학번"
        value={form.student_number}
        onChangeText={createChangeTextHandler('student_number')}
        autoCapitalize="none"
        autoCorrect={false}
        // RN 최신에선 autoCompleteType 대신 autoComplete 사용 권장
        autoComplete="off"
        keyboardType="number-pad"
        returnKeyType="next"
        ref={student_numRef}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <BorderedInput
        hasMarginBottom={isSignUp}
        placeholder="비밀번호"
        value={form.password}
        onChangeText={createChangeTextHandler('password')}
        ref={passwordRef}
        returnKeyType={isSignUp ? 'next' : 'done'}
        onSubmitEditing={() => {
          if (isSignUp) {
            confirmPasswordRef.current?.focus();
          } else {
            onSubmit();
          }
        }}
        secureTextEntry
      />

      {isSignUp && (
        <>
          <BorderedInput
            hasMarginBottom
            placeholder="비밀번호 확인"
            value={form.confirmPassword}
            onChangeText={createChangeTextHandler('confirmPassword')}
            ref={confirmPasswordRef}
            returnKeyType="next"
            onSubmitEditing={() => nicknameRef.current?.focus()}
            secureTextEntry
          />

          <BorderedInput
            hasMarginBottom
            placeholder="닉네임"
            value={form.nickname}
            onChangeText={createChangeTextHandler('nickname')}
            ref={nicknameRef}
            returnKeyType="done"
          />

          <View style={styles.inputWrapper}>
            <Picker
              selectedValue={form.department}
              onValueChange={createChangeTextHandler('department')}
              style={styles.picker}
              dropdownIconColor="#000"
            >
              <Picker.Item label="학과를 선택하세요" value="" enabled={false} />
              <Picker.Item label="컴퓨터공학과" value="컴퓨터공학과" />
              <Picker.Item label="전자공학과" value="전자공학과" />
              <Picker.Item label="기계공학과" value="기계공학과" />
            </Picker>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#8a8a8a80',
    borderRadius: 4,
    backgroundColor: '#fff',
    marginBottom: 12,
    height: 48, 
    justifyContent: 'center',
    overflow: 'hidden',
    
  },
  picker: {
    color: '#8a8a8a',
    marginTop: Platform.OS === 'android' ? -4 : 0, 
    marginLeft: Platform.OS === 'android' ? -4 : 0, 
  },
});
export default SignForm;