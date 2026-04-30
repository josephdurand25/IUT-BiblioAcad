import React from "react";

export const ProgressAverage = () => {
  return (



  <section className="p-8 rounded-lg shadow-md shadow-gray-200 bg-white mt-2 w-full">
    <header className="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 shrink-0 w-6 h-6 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 19l16 0" />
        <path d="M4 15l4 -6l4 2l4 -5l4 4" />
      </svg>
      <h3 className="font-medNium text-lg">Area Liveability Score</h3>
      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0 w-6 h-6 text-gray-500" width={24} height={24} viewbox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
        <path d="M12 9h.01" />
        <path d="M11 12h1v4h1" />
      </svg>
    </header>
    <section className="py-4 grid grid-cols-2 gap-x-6">
      <div className="flex items-center py-3">
        <span className="w-8 h-8 shrink-0 mr-4 rounded-full bg-blue-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M7 21l3 -4" />
            <path d="M16 21l-2 -4l-3 -3l1 -6" />
            <path d="M6 12l2 -3l4 -1l3 3l3 1" />
          </svg>
        </span>
        <div className="space-y-3 flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-sm mr-auto text-gray-700 flex items-center">
              Walkability
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0 w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 9h.01" />
                <path d="M11 12h1v4h1" />
              </svg>
            </h4>
            <span className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-xs">
              6.2 / 10
            </span>
          </div>
          <div className="overflow-hidden bg-blue-50 h-1.5 rounded-full w-full">
            <span className="h-full bg-gray-500 w-full block rounded-full" style={{width: '62%'}} />
          </div>
        </div>
      </div>
      <div className="flex items-center py-3">
        <span className="w-8 h-8 shrink-0 mr-4 rounded-full bg-blue-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M7 21l3 -4" />
            <path d="M16 21l-2 -4l-3 -3l1 -6" />
            <path d="M6 12l2 -3l4 -1l3 3l3 1" />
          </svg>
        </span>
        <div className="space-y-3 flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-sm mr-auto text-gray-700 flex items-center">
              Health
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0 w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 9h.01" />
                <path d="M11 12h1v4h1" />
              </svg>
            </h4>
            <span className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-xs">
              6.8 / 10
            </span>
          </div>
          <div className="overflow-hidden bg-blue-50 h-1.5 rounded-full w-full">
            <span className="h-full bg-gray-500 w-full block rounded-full" style={{width: '68%'}} />
          </div>
        </div>
      </div>
      <div className="flex items-center py-3 border-t border-gray-100">
        <span className="w-8 h-8 shrink-0 mr-4 rounded-full bg-blue-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 21h18" />
            <path d="M19 21v-4" />
            <path d="M19 17a2 2 0 0 0 2 -2v-2a2 2 0 1 0 -4 0v2a2 2 0 0 0 2 2z" />
            <path d="M14 21v-14a3 3 0 0 0 -3 -3h-4a3 3 0 0 0 -3 3v14" />
            <path d="M9 17v4" />
            <path d="M8 13h2" />
            <path d="M8 9h2" />
          </svg>
        </span>
        <div className="space-y-3 flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-sm mr-auto text-gray-700 flex items-center">
              Schools
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0 w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 9h.01" />
                <path d="M11 12h1v4h1" />
              </svg>
            </h4>
            <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs">
              7.3 / 10
            </span>
          </div>
          <div className="overflow-hidden bg-blue-50 h-1.5 rounded-full w-full">
            <span className="h-full bg-gray-500 w-full block rounded-full" style={{width: '73%'}} />
          </div>
        </div>
      </div>
      <div className="flex items-center py-3 border-t border-gray-100">
        <span className="w-8 h-8 shrink-0 mr-4 rounded-full bg-blue-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304z" />
            <path d="M9 11v-5a3 3 0 0 1 6 0v5" />
          </svg>
        </span>
        <div className="space-y-3 flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-sm mr-auto text-gray-700 flex items-center">
              Shopping
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0 w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 9h.01" />
                <path d="M11 12h1v4h1" />
              </svg>
            </h4>
            <span className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-xs">
              6.4 / 10
            </span>
          </div>
          <div className="overflow-hidden bg-blue-50 h-1.5 rounded-full w-full">
            <span className="h-full bg-gray-500 w-full block rounded-full" style={{width: '64%'}} />
          </div>
        </div>
      </div>
      <div className="flex items-center py-3 border-t border-gray-100">
        <span className="w-8 h-8 shrink-0 mr-4 rounded-full bg-blue-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h5- w-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 13l-2 -2" />
            <path d="M12 12l2 -2" />
            <path d="M12 21v-13" />
            <path d="M9.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4z" />
          </svg>
        </span>
        <div className="space-y-3 flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-sm mr-auto text-gray-700 flex items-center">
              Parklands
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0 w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 9h.01" />
                <path d="M11 12h1v4h1" />
              </svg>
            </h4>
            <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs">
              8 / 10
            </span>
          </div>
          <div className="overflow-hidden bg-blue-50 h-1.5 rounded-full w-full">
            <span className="h-full bg-gray-500 w-full block rounded-full" style={{width: '80%'}} />
          </div>
        </div>
      </div>
      <div className="flex items-center py-3 border-t border-gray-100">
        <span className="w-8 h-8 shrink-0 mr-4 rounded-full bg-blue-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M18 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M4 17h-2v-11a1 1 0 0 1 1 -1h14a5 7 0 0 1 5 7v5h-2m-4 0h-8" />
            <path d="M16 5l1.5 7l4.5 0" />
            <path d="M2 10l15 0" />
            <path d="M7 5l0 5" />
            <path d="M12 5l0 5" />
          </svg>
        </span>
        <div className="space-y-3 flex-1">
          <div className="flex items-center">
            <h4 className="font-medium text-sm mr-auto text-gray-700 flex items-center">
              Public Transport
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 shrink-0 w-5 h-5 text-gray-500" width={24} height={24} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M12 9h.01" />
                <path d="M11 12h1v4h1" />
              </svg>
            </h4>
            <span className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs">
              8.7 / 10
            </span>
          </div>
          <div className="overflow-hidden bg-blue-50 h-1.5 rounded-full w-full">
            <span className="h-full bg-gray-500 w-full block rounded-full" style={{width: '87%'}} />
          </div>
        </div>
      </div>
    </section>
  </section>


  );
};


