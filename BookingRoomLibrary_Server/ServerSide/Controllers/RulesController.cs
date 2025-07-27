using Microsoft.AspNetCore.Mvc;
using ServerSide.Constants;
using ServerSide.DTOs;
using ServerSide.DTOs.Rule;
using ServerSide.Filters;
using ServerSide.Services;

namespace ServerSide.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RulesController : ControllerBase
{
    [RoleFilter((int)Roles.Student, (int)Roles.Staff, (int)Roles.Admin)]
    private readonly IRuleService _ruleService;

    public RulesController(IRuleService ruleService)
    {
        _ruleService = ruleService ?? throw new ArgumentNullException(nameof(ruleService));
    }

    [HttpGet]
    public async Task<IActionResult> GetRules()
    {
        var rules = await _ruleService.GetAllRulesAsync();
        return Ok(rules);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRule(int id)
    {
        try
        {
            var rule = await _ruleService.GetRuleByIdAsync(id);
            return Ok(rule);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Rule with ID {id} not found.");
        }
    }
    [HttpPost]
    public async Task<IActionResult> CreateRule([FromBody] RuleDTO ruleDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _ruleService.CreateRuleAsync(ruleDto);
            return CreatedAtAction(nameof(GetRule), new { id = ruleDto.Id }, ruleDto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRule(int id, [FromBody] RuleDTO ruleDto)
    {
        if (id != ruleDto.Id || !ModelState.IsValid)
        {
            return BadRequest();
        }

        try
        {
            await _ruleService.UpdateRuleAsync(ruleDto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Rule with ID {id} not found.");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRule(int id)
    {
        try
        {
            await _ruleService.DeleteRuleAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Rule with ID {id} not found.");
        }
    }
}