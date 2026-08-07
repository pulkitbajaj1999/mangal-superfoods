import StoreLayout from "@/features/store/components/StoreLayout";

export const metadata = {
    title: "Store Dashboard",
    description: "Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
