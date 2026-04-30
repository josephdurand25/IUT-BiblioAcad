interface FooterProps {
  sidebarExpanded: boolean;
}

export const Footer = ({ sidebarExpanded }: FooterProps) => {
    return (
        <div className={`flex items-end bg-white fixed bottom-0 ${sidebarExpanded ? ' w-10/12' : 'lg:ml-20 w-full'}  mt-4`}>
            <footer className="w-full text-slate-700 bg-slate-100 body-font">
                <div className="bg-slate-300">
                    <div className="flex justify-between px-3 py-4 gap-2">
                        <span className="text-sm text-slate-700 capitalize font-semibold">© 2026 SIGIF. All rights reserved </span>
                        <span className="text-sm text-slate-700 capitalize font-semibold text-right">Developped by <span className="font-bold">durand jackson</span></span>
                    </div>
                </div>
            </footer>
        </div>

    );
}