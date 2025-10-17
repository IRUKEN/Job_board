import AuthGuard from '@/components/auth/auth-guard'
import PostJobForm from './post-job-form'

export const metadata = {
  title: 'Post a Job - JobBoard',
  description: 'Page description',
}

export default function PostAJob() {
  return (
    <AuthGuard>
      <PostJobForm />
    </AuthGuard>
  )
}
