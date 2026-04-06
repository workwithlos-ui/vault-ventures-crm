import dynamic from 'next/dynamic';

const DashboardComp = dynamic(() => import('../src/components/DashboardPage'), { ssr: false });

export default function Home() {
  return <DashboardComp />;
}

export async function getServerSideProps() {
  return { props: {} };
}
