import dynamic from 'next/dynamic';

const PortfolioComp = dynamic(() => import('../src/components/PortfolioPage'), { ssr: false });

export default function PortfolioRoute() {
  return <PortfolioComp />;
}

export async function getServerSideProps() {
  return { props: {} };
}
