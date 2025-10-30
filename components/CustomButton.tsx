import React from 'react';
import {StyleSheet, View, Pressable, Text, Platform} from 'react-native';

function CustomButton( {onPress, title, hasMarginBottom, theme='primary'}){
    const isPrimary = theme === 'primary';

    return(
        <View style={
            [styles.block, styles.overflow, hasMarginBottom && styles.margin]
        }>
            <Pressable
                onPress={onPress}
                style={
                    ( {pressed} ) => [
                        styles.wrapper,
                        isPrimary && styles.primaryWrapper,
                        Platform.OS === 'ios' && pressed && {opacity: 0.5},
                    ]
                }

                android_ripple={{
                    color: isPrimary ? '#ffffff' : '#005bac',
                }}
            >
                <Text 
                    style={
                        [styles.text, isPrimary ? styles.primaryText : styles.secondaryText, ]
                    }>
                        {title}
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({

    block:{
        
    },
    overflow: {
        borderRadius: 4,
        overflow: 'hidden',
    },

    primaryWrapper:{
        backgroundColor: '#005bac',
    },

    wrapper: {
        borderRadius: 4,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },

    primaryText:{
        color: 'white',
    },

    secondaryText:{
        color: '#005bac',
    },

    text: {
        fontWeight: 'bold',
        fontSize: 14,
        color: 'white',
    },

    margin: {
        marginBottom: 8,
    },
})

export default CustomButton;