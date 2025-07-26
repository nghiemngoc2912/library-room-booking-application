namespace ServerSide.Exceptions
{
    public class AuthorizeException : Exception
    {
        public AuthorizeException(string message) : base(message)
        {
        }
    }
}
