import { pageMetadata } from '@/lib/seo'
import CertificateVerifyClient from './CertificateVerifyClient'

export const metadata = pageMetadata({
  title: 'Verify Certificate',
  description: 'Verify the authenticity of a Verbivore certificate by entering its unique certificate ID.',
  path: '/certificate-verify',
})

export default function CertificateVerifyPage() {
  return <CertificateVerifyClient />
}
