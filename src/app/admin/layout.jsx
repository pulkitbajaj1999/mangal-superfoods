import AdminLayout from "@/features/admin/components/AdminLayout";

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
