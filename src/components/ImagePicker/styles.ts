import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    groupField: {
        width: '100%',
    },
    fieldLabel: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    btnText: {
        color: '#242c40',
    },
    btn: {
        width: '100%',
        height: 45,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnIcon: {
        position: 'absolute', right: 10
    },
    imgContainer: {
        width: '100%',
        height: 200,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgStyle: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    }
});

export default styles;