import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { isExternalPath } from '../lib/products'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

/** <Link> for routes inside this app, a plain <a> for another product's URL. */
const SmartLink = forwardRef<HTMLAnchorElement, Props>(function SmartLink({ to, ...rest }, ref) {
  return isExternalPath(to) ? <a ref={ref} href={to} {...rest} /> : <Link ref={ref} to={to} {...rest} />
})

export default SmartLink
