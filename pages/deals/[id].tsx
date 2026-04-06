import dynamic from 'next/dynamic';

const DealDetailComp = dynamic(() => import('../../src/components/DealDetailPage'), { ssr: false });

export default function DealDetailRoute() {
  return <DealDetailComp />;
}

export async function getServerSideProps() {
  return { props: {} };
}
