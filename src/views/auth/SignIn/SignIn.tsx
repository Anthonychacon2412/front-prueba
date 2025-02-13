import { Card } from '@/components/ui'
import SignInForm from './SignInForm'

const SignIn = () => {
    return (
        <>
            <div className="mb-8 flex flex-col justify-center items-center">
                <h3 className="mb-1 text-amber-600">¡Bienvenido!</h3>
            </div>
            <SignInForm disableSubmit={false} />
        </>
    )
}

export default SignIn
