import TramiteForm from '@/components/TramiteForm';

export default function EditarTramitePage({ params }: { params: { id: string } }) {
  return <TramiteForm tramiteId={params.id} />;
}
