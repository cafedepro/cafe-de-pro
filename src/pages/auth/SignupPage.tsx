import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Field, FormError } from '../../components/admin/ui'
import { useAuth } from '../../context/AuthContext'
import { signupSchema, type SignupValues } from '../../validation/auth'

export default function SignupPage() {
  const { user, loading, signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [checkEmail, setCheckEmail] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) })

  if (!loading && user) return <Navigate to="/admin" replace />

  const onSubmit = async (v: SignupValues) => {
    setError('')
    try {
      const { needsConfirmation } = await signUp(v.email, v.password, v.fullName)
      if (needsConfirmation) setCheckEmail(true)
      else navigate('/admin', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account.')
    }
  }

  if (checkEmail)
    return (
      <AuthLayout title="Check your email" subtitle="We sent a confirmation link. Open it, then sign in.">
        <Link to="/login" className="font-medium text-emerald-800 underline">
          Go to sign in
        </Link>
      </AuthLayout>
    )

  return (
    <AuthLayout title="Create your account" subtitle="Set up a digital menu in a few minutes.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError>{error}</FormError>
        <Field label="Your name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-emerald-800 underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
