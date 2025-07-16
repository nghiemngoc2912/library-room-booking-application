import AdminHeader from '../Components/AdminHeader';

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminHeader/>
      <main>{children}</main>
    </>
  );
}

