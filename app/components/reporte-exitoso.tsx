import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ReporteExitoso({ report }) {
    const folio = report.id || `REP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

    const formatDate = (dateString) => {
        const date = dateString ? new Date(dateString) : new Date()
        return format(date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
    }

    const fechaReporte = formatDate(report.created_at)

    return (
        <div className="space-y-6">
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 className="text-xl font-bold text-green-800 mb-2">¡Reporte enviado con éxito!</h2>
                <p className="text-green-700 mb-4">
                    Gracias por ayudarnos a mejorar. Hemos recibido tu reporte y lo revisaremos lo antes posible.
                </p>

                <div className="bg-white p-4 rounded-lg inline-block">
                    <div className="text-left">
                        <p className="text-sm text-slate-500">Folio del reporte:</p>
                        <p className="text-lg font-medium text-slate-800 mb-2">{folio}</p>

                        <p className="text-sm text-slate-500">Fecha de recepción:</p>
                        <p className="text-lg font-medium text-slate-800">{fechaReporte}</p>
                    </div>
                </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5">
                <h3 className="text-lg font-medium text-slate-700 mb-4">Detalles del reporte</h3>

                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500">Motivo:</h4>
                        <p className="text-slate-800">{report.reason}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-slate-500">Página:</h4>
                        <p className="text-slate-800">{report.page}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-slate-500">Descripción:</h4>
                        <p className="text-slate-800 whitespace-pre-line">{report.body}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <a
                    href="/"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:outline-none text-sm font-medium"
                >
                    Volver al inicio
                </a>
            </div>
        </div>
    )
}

