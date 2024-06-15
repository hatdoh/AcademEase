import React from "react";
import UserTable from "../components/UserTable";

function Dashboard() {
    return (
        <div className='px-10 w-full mr-20 mb-20 mt-40 bg-dark-purple'>
            <UserTable />
        </div>
    );
}

export default Dashboard;