
function ItemAnalysis() {
    return(
        <div className='flex flex-col px-10 w-full mr-20 mb-20 mt-40 ml-6 bg-dark-purple'>
            <div className='flex flex-nowrap items-center'>
                <button className='mb-3 w-40 ml-5 text-center shadow-sm px-4 py-2 mt-10 rounded-md bg-blue-900 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:ml-4 sm:text-sm' onClick={''}>
                New Test
                </button>
            </div>
            <table className="mt-5 bg-white border-separate border-spacing-0 table-auto border-collapse border border-slate-400">
            <thead>
                <tr>
                <th className="border border-slate-300">Questions</th>
                <th className="border border-slate-300">No.</th>
                <th className="border border-slate-300">% Correct answer in question A</th>
                <th className="border border-slate-300">% Correct answer in question B</th>
                <th className="border border-slate-300">% Correct answer in question C</th>
                <th className="border border-slate-300">% Correct answer in question D</th>
                <th className="border border-slate-300">Remarks</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td className="border border-slate-300">The Sliding Mr. Bones (Next Stop, Pottersville)</td>
                <td className="border border-slate-300">Malcolm Lockyer</td>
                <td className="border border-slate-300">1961</td>
                </tr>
                <tr>
                <td className="border border-slate-300">Witchy Woman</td>
                <td className="border border-slate-300">The Eagles</td>
                <td className="border border-slate-300">1972</td>
                </tr>
                <tr>
                <td className="border border-slate-300">Shining Star</td>
                <td className="border border-slate-300">Earth, Wind, and Fire</td>
                <td className="border border-slate-300">1975</td>
                </tr>
            </tbody>
            </table>
        </div>
    )
}

export default ItemAnalysis;