export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-10">
      <div className="container-xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="text-lg font-extrabold">High Quality Moving</div>
          <p className="text-gray-700 mt-2">Family-owned movers serving the greater OKC area.</p>
        </div>
        <div>
          <div className="font-semibold">Contact</div>
          <ul className="mt-2 space-y-1 text-gray-700">
            <li>Phone: (580) 595-1262</li>
            <li>Email: info@hqmoving.example</li>
            <li>Hours: 7 days a week</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Licensing & Payments</div>
          <ul className="mt-2 space-y-1 text-gray-700">
            <li>Licensed & Insured</li>
            <li>Payment Methods: Visa, MasterCard, AmEx, Discover</li>
          </ul>
        </div>
      </div>
      <div className="container-xl mt-8 text-xs text-gray-600">© {new Date().getFullYear()} High Quality Moving. All rights reserved.</div>
    </footer>
  );
}
