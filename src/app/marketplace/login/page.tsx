import { redirect } from 'next/navigation';

export default function MarketplaceLoginRedirect() {
  redirect('/login');
}
