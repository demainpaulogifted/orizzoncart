import { createClient as createAdminClient } from '@/lib/supabase/admin';

const BANK_CODES: Record<string, string> = {
  'Access Bank': '044', 'Citibank Nigeria': '023', 'Ecobank Nigeria': '050',
  'Fidelity Bank': '070', 'First Bank of Nigeria': '011', 'First City Monument Bank (FCMB)': '214',
  'Globus Bank': '00103', 'Guaranty Trust Bank (GTBank)': '058', 'Heritage Bank': '030',
  'Keystone Bank': '082', 'Polaris Bank': '076', 'Providus Bank': '101',
  'Stanbic IBTC Bank': '221', 'Standard Chartered Bank': '068', 'Sterling Bank': '232',
  'SunTrust Bank': '100', 'Titan Trust Bank': '102', 'Union Bank of Nigeria': '032',
  'United Bank for Africa (UBA)': '033', 'Unity Bank': '215', 'Wema Bank (ALAT)': '035',
  'Zenith Bank': '057', 'Parallex Bank': '104', 'PremiumTrust Bank': '105',
  'Optimus Bank': '107', 'Signature Bank': '106', 'Jaiz Bank': '301',
  'Taj Bank': '302', 'Lotus Bank': '303', 'Moniepoint MFB': '50515',
  'Kuda Bank': '50211', 'Sparkle MFB': '51310', 'Rubies MFB': '125',
  'VFD MFB (V Bank)': '566', 'Carbon (OneFi)': '565', 'FairMoney MFB': '51318',
  'GoMoney': '100022', 'Accion MFB': '602', 'AB Microfinance Bank': '401',
  'LAPO MFB': '403', 'Bainescredit MFB': '51229', 'NPF Microfinance Bank': '50629',
  'Nirsal MFB': '50115', 'Bowen MFB': '50931', 'Amju MFB': '50926',
  'Mutual Benefits MFB': '50604', 'FCT MFB': '50267', 'Microvis MFB': '50819',
  'OPay': '999992', 'PalmPay': '999991', 'Flutterwave Send': '110004', 'EcoMobile (Xpress)': '307',
};

/**
 * OrizzonPay engine: creates subaccount + 5% platform split
 * If merchant has own keys, they keep 100% (no split code created)
 */
export async function ensureOrizzonPay(merchant: any): Promise<any> {
  if (!merchant?.bank_name || !merchant?.account_number) return merchant;
  
  // If merchant already has subaccount and split, return early
  if (merchant.paystack_subaccount_code && merchant.split_code_platform) {
    return merchant;
  }

  // If merchant has own payment keys, they keep 100% - no platform split
  if (merchant.paystack_secret_key || merchant.flutterwave_secret_key) {
    return merchant;
  }

  const secretKey = process.env.PLATFORM_PAYSTACK_SECRET_KEY;
  if (!secretKey) return merchant;

  const headers = { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' };
  const admin = createAdminClient();

  let subaccountCode = merchant.paystack_subaccount_code || null;
  let splitPlatform = merchant.split_code_platform || null;

  try {
    // 1. Create subaccount (merchant's bank account)
    if (!subaccountCode) {
      const res = await fetch('https://api.paystack.co/subaccount', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          business_name: merchant.store_name,
          settlement_bank: BANK_CODES[merchant.bank_name] || '044',
          account_number: merchant.account_number,
          percentage_charge: 0,
          primary_contact_email: merchant.contact_email || 'support@orizzoncart.name.ng',
          primary_contact_name: merchant.account_name || merchant.store_name,
          primary_contact_phone: merchant.whatsapp_number || '08000000000',
        }),
      });
      const data = await res.json();
      if (!data.status) return merchant;
      subaccountCode = data.data.subaccount_code;
    }

    // 2. Create 5% platform split (merchant keeps 95%, platform takes 5%)
    if (!splitPlatform) {
      const res = await fetch('https://api.paystack.co/split', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `${merchant.store_slug}-platform-5pct`,
          type: 'percentage',
          currency: 'NGN',
          subaccounts: [{ subaccount: subaccountCode, share: 95 }],
          bearer_type: 'subaccount',
          bearer_subaccount: subaccountCode,
        }),
      });
      const data = await res.json();
      if (data.status) splitPlatform = data.data.split_code;
    }

    // 3. Save to database
    await admin
      .from('merchants')
      .update({
        paystack_subaccount_code: subaccountCode,
        split_code_platform: splitPlatform,
      })
      .eq('id', merchant.id);

    return {
      ...merchant,
      paystack_subaccount_code: subaccountCode,
      split_code_platform: splitPlatform,
    };
  } catch {
    return merchant;
  }
}