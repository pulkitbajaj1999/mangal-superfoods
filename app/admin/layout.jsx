import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Mangal Superfoods - Admin",
    description: "Mangal Superfoods - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
