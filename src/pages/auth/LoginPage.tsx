import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import { Button, Field, FormError } from '../../components/admin/ui'
import { useAuth } from '../../context/AuthContext'
import { loginSchema, type LoginValues } from '../../validation/auth'

export default function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  if (!loading && user) return <Navigate to="/admin" replace />

  const onSubmit = async (v: LoginValues) => {
    setError('')
    try {
      await signIn(v.email, v.password)
      navigate((location.state as { from?: string } | null)?.from ?? '/admin', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.')
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Manage your menu, prices and QR codes.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError>{error}</FormError>
        <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        New here?{' '}
        <Link to="/signup" className="font-medium text-emerald-800 underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
