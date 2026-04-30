import React from "react";

interface TableDataRow {
  name: string;
  plateNumber: string;
  date: string;
  status: 'Complété' | 'En cours' | 'En attente';
}

interface RecentTableProps {
  data: TableDataRow[];
  title?: string;
}

const RecentTable: React.FC<RecentTableProps> = ({ 
  data, 
  title = "Dernières Immatriculations" 
}) => {
  const getStatusConfig = (status: TableDataRow['status']) => {
    const configs = {
      'Complété': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
      'En cours': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
      'En attente': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' }
    };
    return configs[status];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Demandeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Plaque
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const statusConfig = getStatusConfig(item.status);
              return (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-25 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                      {item.plateNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`}></div>
                      {item.status}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default RecentTable
export {TableDataRow, RecentTableProps}