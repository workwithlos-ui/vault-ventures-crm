import dynamic from 'next/dynamic';

const PipelineComp = dynamic(() => import('../src/components/PipelinePage'), { ssr: false });

export default function PipelineRoute() {
  return <PipelineComp />;
}

export async function getServerSideProps() {
  return { props: {} };
}
