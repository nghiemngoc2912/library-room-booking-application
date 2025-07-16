import LibrarianHeader from '../Components/LibrarianHeader';

export default function LibrarianLayout({ children }) {
  return (
    <>
      <LibrarianHeader/>
      <main>{children}</main>
    </>
  );
}

