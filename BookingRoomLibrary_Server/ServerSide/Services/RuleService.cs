using ServerSide.DTOs;
using ServerSide.DTOs.Rule;
using ServerSide.Models;
using ServerSide.Repositories;

namespace ServerSide.Services
{
    public class RuleService : IRuleService
    {
        private readonly IRuleRepository _ruleRepository;

        public RuleService(IRuleRepository ruleRepository)
        {
            _ruleRepository = ruleRepository ?? throw new ArgumentNullException(nameof(ruleRepository));
        }

        public async Task<RuleDTO> GetRuleByIdAsync(int id)
        {
            var rule = await _ruleRepository.GetRuleByIdAsync(id);
            return MapToDto(rule);
        }

        public async Task<IEnumerable<RuleDTO>> GetAllRulesAsync()
        {
            var rules = await _ruleRepository.GetAllRulesAsync();
            return rules.Select(MapToDto);
        }

        public async Task CreateRuleAsync(RuleDTO ruleDto)
        {
            if (ruleDto == null) throw new ArgumentNullException(nameof(ruleDto));
            if (string.IsNullOrWhiteSpace(ruleDto.RuleName)) throw new ArgumentException("Rule name is required.");

            // Kiểm tra trùng lặp tên rule
            var existingRule = await _ruleRepository.GetRuleByNameAsync(ruleDto.RuleName);
            if (existingRule != null)
            {
                throw new ArgumentException("Rule with this name already exists.");
            }

            var rule = MapToEntity(ruleDto);
            await _ruleRepository.CreateRuleAsync(rule);
        }

        public async Task UpdateRuleAsync(RuleDTO ruleDto)
        {
            if (ruleDto == null) throw new ArgumentNullException(nameof(ruleDto));
            if (string.IsNullOrWhiteSpace(ruleDto.RuleName)) throw new ArgumentException("Rule name is required.");

            // Kiểm tra trùng lặp tên rule (ngoại trừ rule hiện tại)
            var existingRule = await _ruleRepository.GetRuleByNameAsync(ruleDto.RuleName);
            if (existingRule != null && existingRule.Id != ruleDto.Id)
            {
                throw new ArgumentException("Rule with this name already exists.");
            }

            var rule = MapToEntity(ruleDto);
            await _ruleRepository.UpdateRuleAsync(rule);
        }

        public async Task DeleteRuleAsync(int id)
        {
            await _ruleRepository.DeleteRuleAsync(id);
        }

        private RuleDTO MapToDto(Rule rule)
        {
            return new RuleDTO
            {
                Id = rule.Id,
                RuleName = rule.RuleName,
                Description = rule.Description,
                Status = rule.Status,
                CreateAt = rule.CreateAt,
                UserId = rule.UserId
            };
        }

        private Rule MapToEntity(RuleDTO ruleDto)
        {
            return new Rule
            {
                Id = ruleDto.Id,
                RuleName = ruleDto.RuleName,
                Description = ruleDto.Description,
                Status = ruleDto.Status,
                CreateAt = ruleDto.CreateAt ?? DateTime.UtcNow,
                UserId = ruleDto.UserId
            };
        }
    }

    public interface IRuleService
    {
        Task<RuleDTO> GetRuleByIdAsync(int id);
        Task<IEnumerable<RuleDTO>> GetAllRulesAsync();
        Task CreateRuleAsync(RuleDTO ruleDto);
        Task UpdateRuleAsync(RuleDTO ruleDto);
        Task DeleteRuleAsync(int id);
    }
}