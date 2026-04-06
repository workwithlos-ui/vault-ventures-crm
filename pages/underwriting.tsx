import dynamic from 'next/dynamic';
const UnderwritingComp = dynamic(() => import('../src/components/UnderwritingPage'), { ssr: false });
export default function UnderwritingRoute() {
  return <UnderwritingComp />;
}
export async function getServerSideProps() {
  return { props: {} };
}
