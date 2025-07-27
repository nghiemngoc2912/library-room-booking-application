using Microsoft.EntityFrameworkCore;
using ServerSide.Models;

namespace ServerSide.Repositories
{
    public class RuleRepository : IRuleRepository
    {
        private readonly LibraryRoomBookingContext _context;

        public RuleRepository(LibraryRoomBookingContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Rule> GetRuleByIdAsync(int id)
        {
            return await _context.Rules
                .FirstOrDefaultAsync(r => r.Id == id)
                ?? throw new KeyNotFoundException($"Rule with ID {id} not found.");
        }

        public async Task<Rule> GetRuleByNameAsync(string ruleName)
        {
            return await _context.Rules
                .FirstOrDefaultAsync(r => r.RuleName.ToLower() == ruleName.ToLower());
        }

        public async Task<IEnumerable<Rule>> GetAllRulesAsync()
        {
            return await _context.Rules.ToListAsync();
        }

        public async Task CreateRuleAsync(Rule rule)
        {
            if (rule == null) throw new ArgumentNullException(nameof(rule));
            rule.CreateAt = DateTime.UtcNow; // Đặt thời gian tạo mặc định
            _context.Rules.Add(rule);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRuleAsync(Rule rule)
        {
            if (rule == null) throw new ArgumentNullException(nameof(rule));
            var existingRule = await _context.Rules.FindAsync(rule.Id);
            if (existingRule == null) throw new KeyNotFoundException($"Rule with ID {rule.Id} not found.");

            existingRule.RuleName = rule.RuleName;
            existingRule.Description = rule.Description;
            existingRule.Status = rule.Status;
            existingRule.UserId = rule.UserId;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteRuleAsync(int id)
        {
            var rule = await _context.Rules.FindAsync(id);
            if (rule == null) throw new KeyNotFoundException($"Rule with ID {id} not found.");

            _context.Rules.Remove(rule);
            await _context.SaveChangesAsync();
        }
    }

    public interface IRuleRepository
    {
        Task<Rule> GetRuleByIdAsync(int id);
        Task<Rule> GetRuleByNameAsync(string ruleName);
        Task<IEnumerable<Rule>> GetAllRulesAsync();
        Task CreateRuleAsync(Rule rule);
        Task UpdateRuleAsync(Rule rule);
        Task DeleteRuleAsync(int id);
    }
}