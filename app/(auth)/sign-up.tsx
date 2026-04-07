import { Link } from 'expo-router'
import { Text, View } from 'react-native'

const SignUp = () => {
    return (
        <View>
            <Text>SignIn</Text>
            <Link href="/(auth)/sign-up">create Account</Link>
        </View>
    )
}

export default SignUp