import StoreLayout from "@/components/store/StoreLayout";

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
