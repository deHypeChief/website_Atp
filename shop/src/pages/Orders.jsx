import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { Link, useLocation } from 'react-router-dom'
import { getMyOrders, getUser } from '../lib/api'
import { clientAuthUrl } from '../lib/auth'
import { CLIENT_URL, money } from '../lib/config'

const orderStatus = order => (order.status || order.paymentStatus || 'Processing').toString()
const orderDate = value => value && !Number.isNaN(new Date(value).getTime())
  ? new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  : 'Date unavailable'

/**
 * Order history for the signed-in player. This is the club's order desk — the ATP dashboard
 * links here rather than keeping a second copy of the same list.
 */
export default function Orders() {
  const location = useLocation()
  const [user, setUser] = useState(getUser)
  const [orders, setOrders] = useState([])
  const [state, setState] = useState('loading')
  const [filter, setFilter] = useState('All orders')

  useEffect(() => {
    const sync = () => setUser(getUser())
    window.addEventListener('atp-auth-change', sync)
    return () => window.removeEventListener('atp-auth-change', sync)
  }, [])

  useEffect(() => {
    if (!user) { setState('guest'); return }
    let active = true
    setState('loading')
    getMyOrders()
      .then(list => { if (active) { setOrders(list); setState('ready') } })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [user])

  const filters = useMemo(() => ['All orders', ...new Set(orders.map(orderStatus))], [orders])
  const visible = filter === 'All orders' ? orders : orders.filter(order => orderStatus(order) === filter)
  const paid = orders.filter(order => (order.paymentStatus || '').toLowerCase() === 'paid').length
  const spent = orders.reduce((total, order) => total + Number(order.total || 0), 0)

  return <div className="RoyaleOrders RoyaleShell">
    <header className="RoyaleOrdersHead">
      <p>ATP ROYALE / ORDER DESK</p>
      <h1>Your orders.</h1>
      <span>Every ATP ROYALE purchase, from payment through to delivery.</span>
    </header>

    {state === 'guest' && <div className="RoyaleOrdersState">
      <Icon icon="solar:user-rounded-linear" />
      <h2>Sign in to see your orders.</h2>
      <p>Your ATP player account carries your full purchase history.</p>
      <Link className="RoyaleButton" to={clientAuthUrl('login', `${location.pathname}${location.search}`)}>Sign in <Icon icon="solar:arrow-right-linear" /></Link>
    </div>}

    {state === 'loading' && <div className="RoyaleOrdersLoading">{Array.from({ length: 3 }, (_, index) => <i key={index} />)}</div>}

    {state === 'error' && <div className="RoyaleOrdersState">
      <Icon icon="solar:danger-circle-linear" />
      <h2>Orders are unavailable.</h2>
      <p>We could not load your order history. Refresh the page to try again.</p>
    </div>}

    {state === 'ready' && !orders.length && <div className="RoyaleOrdersState">
      <Icon icon="solar:bag-cross-linear" />
      <h2>No orders yet.</h2>
      <p>Court essentials and ATP ROYALE club pieces are waiting in the collection.</p>
      <Link className="RoyaleButton" to="/catalog">Shop the collection <Icon icon="solar:arrow-right-linear" /></Link>
    </div>}

    {state === 'ready' && orders.length > 0 && <>
      <section className="RoyaleOrderMetrics" aria-label="Order summary">
        <article><Icon icon="solar:box-linear" /><div><small>All orders</small><strong>{String(orders.length).padStart(2, '0')}</strong></div></article>
        <article><Icon icon="solar:verified-check-linear" /><div><small>Paid orders</small><strong>{String(paid).padStart(2, '0')}</strong></div></article>
        <article><Icon icon="solar:wallet-money-linear" /><div><small>Total value</small><strong>{money(spent)}</strong></div></article>
      </section>

      <nav className="RoyaleOrderFilters" aria-label="Filter orders by status">
        {filters.map(status => <button type="button" key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{status}</button>)}
      </nav>

      <div className="RoyaleOrderList">{visible.map(order => <OrderCard key={order._id || order.orderNumber} order={order} />)}</div>
    </>}

    <p className="RoyaleOrdersFoot">Need help with an order? <a href={`${CLIENT_URL}/contact`}>Contact ATP</a>.</p>
  </div>
}

function OrderCard({ order }) {
  const status = orderStatus(order)
  const items = order.items || []
  const count = items.reduce((total, item) => total + Number(item.quantity || 1), 0)
  const address = typeof order.delivery?.address === 'string' ? order.delivery.address : 'Delivery details saved'
  return <article className="RoyaleOrderCard">
    <header>
      <div><small>Order reference</small><strong>{order.orderNumber || order._id?.slice(-8) || 'ATP order'}</strong></div>
      <span className={`RoyaleOrderStatus ${status.toLowerCase().replaceAll(' ', '-')}`}><i />{status}</span>
    </header>
    <div className="RoyaleOrderBody">
      <div>
        <time>{orderDate(order.createdAt)}</time>
        <ul>{items.map((item, index) => <li key={`${item.name}-${index}`}><span>{item.quantity || 1}× {item.name || 'ATP product'}</span><b>{money((item.price || 0) * (item.quantity || 1))}</b></li>)}</ul>
      </div>
      <div className="RoyaleOrderTotal"><small>Order total</small><strong>{money(order.total)}</strong></div>
    </div>
    <footer>
      <span><Icon icon="solar:bag-4-linear" />{count} {count === 1 ? 'item' : 'items'}</span>
      <span><Icon icon="solar:card-linear" />Payment: {order.paymentStatus || 'Pending'}</span>
      <span><Icon icon="solar:map-point-linear" />{address}</span>
    </footer>
  </article>
}
