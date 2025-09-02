import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../loading/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  const { fetchCourse, fetchCourses, fetchMyCourse } = CourseData();
  const { fetchUser } = UserData();

useEffect(() => {
  const loadCourse = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${server}/api/course/${params.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setCourse(data.course);

    } catch (error) {
      console.error("Failed to fetch course:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  loadCourse();
}, [params.id]);

  // Function to dynamically load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to purchase");
      return;
    }
    setLoading(true);

    try {
      console.log("Initiating checkout for course ID:", params.id);

      // Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet connection.");
      }

      const { data: { order } } = await axios.post(
        `${server}/api/course/checkout/${params.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Checkout response:", order);

      const options = {
        key: "rzp_test_g6jqqX5qJdPap8", // Your test key
        amount: order.amount, // Amount in paise from backend
        currency: "INR",
        name: "ELearningX",
        description: "Learn with us",
        order_id: order.id,
        handler: async function (response) {
          console.log("Razorpay response:", response);
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

          try {
            const { data } = await axios.post(
              `${server}/api/verification/${params.id}`,
              {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            await fetchUser();
            await fetchCourses();
            await fetchMyCourse();
            toast.success(data.message);
            navigate(`/payment-success/${razorpay_payment_id}`);
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(error.response?.data?.message || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        theme: {
          color: "#8a4baf",
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed: " + response.error.description);
        setLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : course ? (
        <div className="course-description">
          <div className="course-header">
            <img
              src={`${server}/${course.image}`}
              alt={course.title}
              className="course-image"
            />
            <div className="course-info">
              <h2>{course.title}</h2>
              <p>Instructor: {course.createdBy}</p>
              <p>Duration: {course.duration} weeks</p>
            </div>
          </div>

          <p>{course.description}</p>

          <p>Let's get started with course At ₹{course.price}</p>

          {user && user.subscription && user.subscription.includes(course._id) ? (
            <button
              onClick={() => navigate(`/course/study/${course._id}`)}
              className="common-btn"
            >
              Study
            </button>
          ) : (
            <button onClick={checkoutHandler} className="common-btn">
              Buy Now
            </button>
          )}
        </div>
      ) : (
        <div>Course not found</div>
      )}
    </>
  );
};

export default CourseDescription;