namespace ServerSide.Exceptions
{
    public class BookingPolicyViolationException:Exception
    {
        public BookingPolicyViolationException(string message) : base(message)
        {
        }
    }
}
