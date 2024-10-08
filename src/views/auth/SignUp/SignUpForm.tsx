import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from '@/utils/hooks/useAuth'
import type { CommonProps } from '@/@types/common'
import { Notification, toast } from '@/components/ui'

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    signInUrl?: string
}

type SignUpFormSchema = {
    userName: string
    password: string
    email: string
}

const validationSchema = Yup.object().shape({
    userName: Yup.string().required('Por favor ingrese su nombre de usuario'),
    email: Yup.string()
        .email('Correo invalido')
        .required('Por favor ingrese un correo'),
    password: Yup.string().required('Por favor ingrese una contraseña'),
    confirmPassword: Yup.string().oneOf(
        [Yup.ref('password')],
        'Las contraseñas no coinciden',
    ),
})

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, signInUrl = '/sign-in' } = props

    const { signUp } = useAuth()

    const [message, setMessage] = useTimeOutMessage()

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        setSubmitting(true)

        console.log(values)

        const newUser = {
            name: values.userName,
            email: values.email,
            registered: true,
            status: true,
            verified: false,
            password: values.password,
        }

        console.log(newUser)

        signUp(newUser)
            .then((resp) => {
                console.log(resp)
            })
            .catch((error) => {
                console.log(error)
                // if (result?.status === 'failed') {
                switch (error) {
                    case 'FirebaseError: Firebase: Password should be at least 6 characters (auth/weak-password).':
                        showToast(
                            'La contraseña debe tener al menos 6 caracteres.',
                        )

                        break
                    case 'Firebase: Error (auth/email-already-in-use).':
                        showToast(
                            'La dirección de correo electrónico ya está en uso por otra cuenta',
                        )
                        break
                    case 'Firebase: Error (auth/invalid-email).':
                        showToast(
                            'La dirección de correo electrónico no es valida',
                        )
                        break
                    default:
                        showToast(error)
                        break
                }
                // }
            })

        setSubmitting(false)
    }

    const showToast = (message: any = '') => {
        toast.push(
            <Notification title={'Atención'} type="warning" duration={2500}>
                {message}
            </Notification>,
            {
                placement: 'top-center',
            },
        )
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    userName: '',
                    password: '',
                    confirmPassword: '',
                    email: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    if (!disableSubmit) {
                        onSignUp(values, setSubmitting)
                    } else {
                        setSubmitting(false)
                    }
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label="Nombre de Usuario"
                                invalid={errors.userName && touched.userName}
                                errorMessage={errors.userName}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="userName"
                                    placeholder="Nombre de usuario"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Correo"
                                invalid={errors.email && touched.email}
                                errorMessage={errors.email}
                            >
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    placeholder="Correo"
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label="Contraseña"
                                invalid={errors.password && touched.password}
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder="Contraseña"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label="Confrimar Contraseña"
                                invalid={
                                    errors.confirmPassword &&
                                    touched.confirmPassword
                                }
                                errorMessage={errors.confirmPassword}
                            >
                                <Field
                                    autoComplete="off"
                                    name="confirmPassword"
                                    placeholder="Confrimar Contraseña"
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting ? 'Creando cuenta' : 'Registrar'}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>¿Ya tienes una cuenta? </span>
                                <ActionLink to={signInUrl}>
                                    Iniciar Sesion
                                </ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SignUpForm
