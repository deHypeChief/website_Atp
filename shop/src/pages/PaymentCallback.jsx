import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyOrder } from '../lib/api'
import { CLIENT_URL } from '../lib/config'
import { useCart } from '../store/cart'

export default function PaymentCallback() {
  const [params] = useSearchParams()
  const cart = useCart()
  const orderId = params.get('orderId')
  const reference = params.get('reference') || params.get('trxref')
  const invalidCallback = !orderId || !reference
  const [state, setState] = useState(invalidCallback ? { status: 'error', message: 'The payment confirmation link is incomplete.', order: null } : { status: 'loading', message: 'Confirming your ATP Royal payment…', order: null })

  useEffect(() => {
    if (!orderId || !reference) return
    verifyOrder(orderId, reference).then(data => { cart.clear(); setState({ status: 'success', message: data.message, order: data.order }) }).catch(error => setState({ status: 'error', message: error.message, order: null }))
  // cart methods intentionally excluded so verification only follows URL values
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, reference])

  return <section className={`royalPaymentState ${state.status}`}><div><Icon icon={state.status === 'success' ? 'solar:check-circle-bold' : state.status === 'error' ? 'solar:danger-triangle-bold' : 'solar:refresh-circle-linear'} /><p>ATP ROYAL / PAYMENT</p><h1>{state.status === 'success' ? 'Order secured.' : state.status === 'error' ? 'Payment needs attention.' : 'Checking the score.'}</h1><span>{state.message}</span>{state.order && <dl><div><dt>Order</dt><dd>{state.order.orderNumber}</dd></div><div><dt>Total</dt><dd>₦{Number(state.order.total).toLocaleString('en-NG')}</dd></div><div><dt>Status</dt><dd>{state.order.status}</dd></div></dl>}<div><a className="royalButton" href={`${CLIENT_URL}/u/orders`}>Track in ATP dashboard <Icon icon="solar:arrow-right-up-linear" /></a><Link to="/catalog">Return to the collection</Link></div></div></section>
}
