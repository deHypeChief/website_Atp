import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { acceptSessionFromHash, clientAuthUrl } from '../lib/auth'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [failed, setFailed] = useState(false)
  const returnTo = params.get('returnTo') || '/'

  useEffect(() => {
    const safeReturn = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'
    if (acceptSessionFromHash()) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      window.dispatchEvent(new Event('atp-auth-change'))
      navigate(safeReturn, { replace: true })
    } else Promise.resolve().then(() => setFailed(true))
  }, [navigate, returnTo])

  return <div className="royalPageState"><Icon icon={failed ? 'solar:danger-circle-linear' : 'solar:refresh-circle-linear'} />{failed ? <><h1>Sign-in handoff expired.</h1><p>Return to ATP and sign in again to continue.</p><a href={clientAuthUrl('login', returnTo)}>Sign in with ATP</a><Link to="/">Return to ATP Royal</Link></> : <><h1>Opening your club account.</h1><p>You’ll return to your ATP Royal order in a moment.</p></>}</div>
}
