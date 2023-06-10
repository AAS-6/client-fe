"use client";

import CartList from "@/components/cart/CartList";
import { supabase } from "@/lib/supabase";
import { setPage } from "@/store/ui-slice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const page = useSelector((state: any) => state.ui.page);
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState<{
    id: string;
    addressId: string;
  }>();

  const handleNext = () => {
    if (page === "SHIPPING") {
      getPayment();
    }

    if (page === "CART") {
      dispatch(setPage("SHIPPING"));
      updateAddress();
    }
  };

  const {
    data: address,
    mutate: updateAddress,
    isLoading: loadingAddress,
  } = useMutation({
    mutationFn: async () => {
      let userId = user?.id;

      if (!user) {
        const session = await supabase.auth.getSession();
        userId = session?.data.session?.user.id;
      }

      const res = await fetch(`/api/address?userId=${userId}`);

      const data = await res.json();

      return data.result;
    },

    onSuccess: data => {
      console.log(data);
      if (!data?.addressLine1) {
        router.push("/profile");
      }
    },
  });

  const { data: cart, isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      let userId = user?.id;

      if (!user) {
        const session = await supabase.auth.getSession();
        userId = session?.data.session?.user.id;
      }

      const data = await fetch(`/api/customers/${userId}/cart`);
      const result = await data.json();

      return result;
    },
  });

  const { mutate: getPayment } = useMutation({
    mutationKey: ["payment"],
    mutationFn: async () => {
      let userId = user?.id;

      if (!user) {
        const session = await supabase.auth.getSession();
        userId = session?.data.session?.user.id;
      }

      const total = cart.items.reduce((acc: any, curr: any) => {
        return acc + curr.variant.price * curr.quantity;
      }, 0);

      const order = await fetch(`/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          cart,
          total,
          addressId: address?.id,
        }),
      });

      const data = await fetch(`/api/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          total,
          cart,
        }),
      });

      const result = await data.json();

      return result;
    },

    onSuccess: data => {
      console.log(data);
      router.push(data.transaction.redirect_url);
    },
  });

  return (
    <main className='space-y-8'>
      {page === "CART" && (
        <div className='mx-[90px]'>
          <CartList />
        </div>
      )}
      {page === "SHIPPING" && (
        <form>
          <div className='max-w-2xl mx-auto gap-y-5 justify-center shadow-2xl rounded-2xl'>
            <div className='p-9'>
              <div className='w-full mt-4'>
                <div className='md:flex md:items-center md:justify-between mb-6'>
                  <div className='md:w-4/12'>
                    <label
                      className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'
                      htmlFor='inline-first-name'
                    >
                      Nama Depan
                    </label>
                  </div>
                  <div className='md:w-full'>
                    <h1 className='appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#5F72FF]'>
                      {address?.firstName}
                    </h1>
                  </div>
                </div>
                <div className='md:flex md:items-center md:justify-between mb-6 w-full'>
                  <div className='md:w-4/12'>
                    <label
                      className='block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4'
                      htmlFor='inline-last-name'
                    >
                      Last Name
                    </label>
                  </div>
                  <div className='md:w-full'>
                    <h1 className='appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#5F72FF]'>
                      {address?.lastName}
                    </h1>
                  </div>
                </div>

                <div className='md:flex md:items-top mb-6'>
                  <div className='md:w-3/12'>
                    <label
                      className='block text-gray-500 font-bold md:text-right my-3 md:mb-0 pr-4 '
                      htmlFor='inline-password'
                    >
                      Alamat
                    </label>
                  </div>
                  {address && (
                    <div className='flex-col space-y-4 md:w-9/12'>
                      <h1 className='appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#5F72FF]'>
                        {`${address?.addressLine1} ${address.city_v2.type} ${address.city_v2.cityName}, ${address.city_v2.provinceName}`}
                      </h1>
                    </div>
                  )}

                  {loadingAddress && (
                    <div className='flex-col space-y-4 md:w-9/12'>
                      Loading ...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
      {page === "PAYMENT" && <div></div>}
      <div className='md:flex md:items-center mb-4'>
        <button
          onClick={handleNext}
          className='shadow bg-[#5F72FF]  focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded w-full mx-[90px]'
          type='button'
        >
          {page === "CART" ? "Next" : page === "SHIPPING" ? "Next" : "Finish"}
        </button>
      </div>
    </main>
  );
}
