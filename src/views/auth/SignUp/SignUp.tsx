import { Card } from '@/components/ui'
import SignUpForm from './SignUpForm'

const SignUp = () => {
    return (
        <>
            <div className="mb-8 flex justify-center items-center">
                <h3>Registro</h3>
            </div>
            <SignUpForm disableSubmit={false} />
        </>
    )
}

export default SignUp
